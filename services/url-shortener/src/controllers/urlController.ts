import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { Url } from '../models/Url';
import { createUrlSchema, getUrlSchema, urlQuerySchema } from '../validations/url';
import { BadRequestError, NotFoundError, cache } from '@backend-services/shared';
import { logger } from '../utils/logger';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';

export const createUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { originalUrl, expiresIn, customCode } = req.body;
    const userId = req.user?.userId;

    // Check if custom code is already in use
    if (customCode) {
      const existingUrl = await Url.findOne({ shortCode: customCode });
      if (existingUrl) {
        throw new BadRequestError('Custom code is already in use');
      }
    }

    // Calculate expiration date if provided
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
      : undefined;

    const url = await Url.create({
      originalUrl,
      shortCode: customCode || nanoid(10),
      expiresAt,
      userId
    });

    logger.info('URL shortened successfully', {
      urlId: url.id,
      shortCode: url.shortCode
    });

    res.status(201).json({
      status: 'success',
      data: {
        originalUrl: url.originalUrl,
        shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
        shortCode: url.shortCode,
        expiresAt: url.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      throw new NotFoundError('URL not found');
    }

    // Check if URL has expired
    if (url.expiresAt && url.expiresAt < new Date()) {
      throw new NotFoundError('URL has expired');
    }

    // Increment click count
    url.clicks += 1;
    await url.save();

    logger.info('URL accessed', {
      urlId: url.id,
      shortCode: url.shortCode,
      clicks: url.clicks
    });

    res.redirect(url.originalUrl);
  } catch (error) {
    next(error);
  }
};

export const deleteUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shortCode } = req.params;
    const userId = req.user?.userId;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      throw new NotFoundError('URL not found');
    }

    // Check ownership
    if (userId && url.userId !== userId) {
      throw new BadRequestError('Not authorized to delete this URL');
    }

    await url.deleteOne();

    logger.info('URL deleted successfully', {
      urlId: url.id,
      shortCode: url.shortCode
    });

    res.status(200).json({
      status: 'success',
      message: 'URL deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shortCode } = req.params;
    const { originalUrl, expiresIn } = req.body;
    const userId = req.user?.userId;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      throw new NotFoundError('URL not found');
    }

    // Check ownership
    if (userId && url.userId !== userId) {
      throw new BadRequestError('Not authorized to update this URL');
    }

    // Update fields
    if (originalUrl) url.originalUrl = originalUrl;
    if (expiresIn) {
      url.expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
    }

    await url.save();

    logger.info('URL updated successfully', {
      urlId: url.id,
      shortCode: url.shortCode
    });

    res.status(200).json({
      status: 'success',
      data: {
        originalUrl: url.originalUrl,
        shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
        shortCode: url.shortCode,
        expiresAt: url.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listUrls = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user?.userId;

    const query = userId ? { userId } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const sort: Record<string, 1 | -1> = {
      [sortBy as string]: sortOrder === 'desc' ? -1 : 1
    };

    const [urls, total] = await Promise.all([
      Url.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Url.countDocuments(query)
    ]);

    logger.info('URLs listed successfully', {
      userId,
      page,
      limit,
      total
    });

    res.status(200).json({
      status: 'success',
      data: {
        urls: urls.map(url => ({
          originalUrl: url.originalUrl,
          shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
          shortCode: url.shortCode,
          clicks: url.clicks,
          expiresAt: url.expiresAt,
          createdAt: url.createdAt
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
}; 