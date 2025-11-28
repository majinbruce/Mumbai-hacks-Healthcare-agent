import { query, transaction } from '../config/database.js';
import logger from '../utils/logger.js';

class Prediction {
  // Create a new prediction
  static async create(predictionData) {
    const {
      festival,
      aqi,
      epidemic,
      currentStaffing,
      currentSupply,
      recommendations
    } = predictionData;

    try {
      const result = await query(
        `INSERT INTO predictions
        (festival, aqi, epidemic, current_staffing, current_supply, recommendations)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          festival || null,
          aqi || null,
          epidemic || null,
          JSON.stringify(currentStaffing),
          JSON.stringify(currentSupply),
          JSON.stringify(recommendations)
        ]
      );

      logger.info(`Created prediction with ID: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating prediction:', error);
      throw error;
    }
  }

  // Get all predictions with pagination
  static async getAll(limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT * FROM predictions
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countResult = await query('SELECT COUNT(*) FROM predictions');
      const total = parseInt(countResult.rows[0].count);

      return {
        predictions: result.rows,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      };
    } catch (error) {
      logger.error('Error fetching predictions:', error);
      throw error;
    }
  }

  // Get prediction by ID
  static async getById(id) {
    try {
      const result = await query(
        'SELECT * FROM predictions WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching prediction ${id}:`, error);
      throw error;
    }
  }

  // Search predictions by filters
  static async search(filters = {}) {
    const { festival, aqi, epidemic, limit = 50, offset = 0 } = filters;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (festival) {
      whereConditions.push(`festival ILIKE $${paramCount}`);
      params.push(`%${festival}%`);
      paramCount++;
    }

    if (aqi) {
      whereConditions.push(`aqi ILIKE $${paramCount}`);
      params.push(`%${aqi}%`);
      paramCount++;
    }

    if (epidemic) {
      whereConditions.push(`epidemic ILIKE $${paramCount}`);
      params.push(`%${epidemic}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    try {
      const result = await query(
        `SELECT * FROM predictions
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        [...params, limit, offset]
      );

      const countResult = await query(
        `SELECT COUNT(*) FROM predictions ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].count);

      return {
        predictions: result.rows,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      };
    } catch (error) {
      logger.error('Error searching predictions:', error);
      throw error;
    }
  }

  // Delete prediction by ID
  static async delete(id) {
    try {
      const result = await query(
        'DELETE FROM predictions WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      logger.info(`Deleted prediction with ID: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error deleting prediction ${id}:`, error);
      throw error;
    }
  }

  // Get statistics
  static async getStatistics() {
    try {
      const result = await query(`
        SELECT
          COUNT(*) as total_predictions,
          COUNT(CASE WHEN festival IS NOT NULL THEN 1 END) as festival_predictions,
          COUNT(CASE WHEN aqi IS NOT NULL THEN 1 END) as aqi_predictions,
          COUNT(CASE WHEN epidemic IS NOT NULL THEN 1 END) as epidemic_predictions,
          MIN(created_at) as first_prediction_date,
          MAX(created_at) as last_prediction_date
        FROM predictions
      `);

      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching statistics:', error);
      throw error;
    }
  }

  // Get recent predictions (last 7 days)
  static async getRecent(days = 7) {
    try {
      const result = await query(
        `SELECT * FROM predictions
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        ORDER BY created_at DESC`,
        []
      );

      return result.rows;
    } catch (error) {
      logger.error('Error fetching recent predictions:', error);
      throw error;
    }
  }
}

export default Prediction;
