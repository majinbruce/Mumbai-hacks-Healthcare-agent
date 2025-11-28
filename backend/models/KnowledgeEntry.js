import { query } from '../config/database.js';
import logger from '../utils/logger.js';

class KnowledgeEntry {
  // Create a new knowledge entry
  static async create(entryData) {
    const {
      festival,
      aqi,
      season,
      healthImpact,
      recommendedStaffing,
      requiredSupplies,
      patientAdvisory,
      source = 'manual'
    } = entryData;

    try {
      const result = await query(
        `INSERT INTO knowledge_entries
        (festival, aqi, season, health_impact, recommended_staffing, required_supplies, patient_advisory, source)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          festival || null,
          aqi || null,
          season || null,
          healthImpact,
          recommendedStaffing || '',
          requiredSupplies || '',
          patientAdvisory || '',
          source
        ]
      );

      logger.info(`Created knowledge entry with ID: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating knowledge entry:', error);
      throw error;
    }
  }

  // Bulk insert knowledge entries (useful for file uploads)
  static async createMany(entries) {
    if (!entries || entries.length === 0) {
      return [];
    }

    const values = [];
    const params = [];
    let paramCount = 1;

    entries.forEach((entry) => {
      const {
        festival,
        aqi,
        season,
        healthImpact,
        recommendedStaffing,
        requiredSupplies,
        patientAdvisory,
        source = 'file'
      } = entry;

      values.push(
        `($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4}, $${paramCount + 5}, $${paramCount + 6}, $${paramCount + 7})`
      );

      params.push(
        festival || null,
        aqi || null,
        season || null,
        healthImpact,
        recommendedStaffing || '',
        requiredSupplies || '',
        patientAdvisory || '',
        source
      );

      paramCount += 8;
    });

    try {
      const result = await query(
        `INSERT INTO knowledge_entries
        (festival, aqi, season, health_impact, recommended_staffing, required_supplies, patient_advisory, source)
        VALUES ${values.join(', ')}
        RETURNING *`,
        params
      );

      logger.info(`Created ${result.rows.length} knowledge entries`);
      return result.rows;
    } catch (error) {
      logger.error('Error creating multiple knowledge entries:', error);
      throw error;
    }
  }

  // Get all knowledge entries with pagination
  static async getAll(limit = 100, offset = 0) {
    try {
      const result = await query(
        `SELECT * FROM knowledge_entries
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countResult = await query('SELECT COUNT(*) FROM knowledge_entries');
      const total = parseInt(countResult.rows[0].count);

      return {
        entries: result.rows,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      };
    } catch (error) {
      logger.error('Error fetching knowledge entries:', error);
      throw error;
    }
  }

  // Get knowledge entry by ID
  static async getById(id) {
    try {
      const result = await query(
        'SELECT * FROM knowledge_entries WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching knowledge entry ${id}:`, error);
      throw error;
    }
  }

  // Search knowledge entries
  static async search(filters = {}) {
    const { festival, aqi, season, searchText, limit = 100, offset = 0 } = filters;

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

    if (season) {
      whereConditions.push(`season ILIKE $${paramCount}`);
      params.push(`%${season}%`);
      paramCount++;
    }

    if (searchText) {
      whereConditions.push(
        `(health_impact ILIKE $${paramCount} OR recommended_staffing ILIKE $${paramCount} OR required_supplies ILIKE $${paramCount} OR patient_advisory ILIKE $${paramCount})`
      );
      params.push(`%${searchText}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    try {
      const result = await query(
        `SELECT * FROM knowledge_entries
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        [...params, limit, offset]
      );

      const countResult = await query(
        `SELECT COUNT(*) FROM knowledge_entries ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].count);

      return {
        entries: result.rows,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      };
    } catch (error) {
      logger.error('Error searching knowledge entries:', error);
      throw error;
    }
  }

  // Update knowledge entry
  static async update(id, updateData) {
    const {
      festival,
      aqi,
      season,
      healthImpact,
      recommendedStaffing,
      requiredSupplies,
      patientAdvisory
    } = updateData;

    try {
      const result = await query(
        `UPDATE knowledge_entries
        SET festival = COALESCE($1, festival),
            aqi = COALESCE($2, aqi),
            season = COALESCE($3, season),
            health_impact = COALESCE($4, health_impact),
            recommended_staffing = COALESCE($5, recommended_staffing),
            required_supplies = COALESCE($6, required_supplies),
            patient_advisory = COALESCE($7, patient_advisory)
        WHERE id = $8
        RETURNING *`,
        [festival, aqi, season, healthImpact, recommendedStaffing, requiredSupplies, patientAdvisory, id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      logger.info(`Updated knowledge entry with ID: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating knowledge entry ${id}:`, error);
      throw error;
    }
  }

  // Delete knowledge entry
  static async delete(id) {
    try {
      const result = await query(
        'DELETE FROM knowledge_entries WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      logger.info(`Deleted knowledge entry with ID: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error deleting knowledge entry ${id}:`, error);
      throw error;
    }
  }

  // Get statistics
  static async getStatistics() {
    try {
      const result = await query(`
        SELECT
          COUNT(*) as total_entries,
          COUNT(DISTINCT festival) as unique_festivals,
          COUNT(DISTINCT aqi) as unique_aqi_levels,
          COUNT(DISTINCT season) as unique_seasons,
          COUNT(CASE WHEN source = 'manual' THEN 1 END) as manual_entries,
          COUNT(CASE WHEN source = 'file' THEN 1 END) as file_entries,
          COUNT(CASE WHEN source = 'pdf' THEN 1 END) as pdf_entries,
          COUNT(CASE WHEN source = 'csv' THEN 1 END) as csv_entries
        FROM knowledge_entries
      `);

      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching knowledge statistics:', error);
      throw error;
    }
  }
}

export default KnowledgeEntry;
