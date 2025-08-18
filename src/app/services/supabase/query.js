import supabase from "../supabase";

/**
 * Flexible utility function for querying Supabase tables
 * @param {string} table The table name to query
 * @param {object} options Query options including filters, pagination, sorting
 * @returns {object} Result object with success status and data
 */
export async function fetchData(table, options = {}) {
  // Remove empty values from options
  const cleanOptions = Object.fromEntries(
    Object.entries(options).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        (typeof value !== "string" || value.trim() !== "") &&
        (!Array.isArray(value) || value.length > 0) &&
        (!(typeof value === "object" && !Array.isArray(value)) ||
          Object.keys(value).length > 0)
    )
  );

  const {
    select = "*",
    filters = {},
    notEquals = {},
    sort = null,
    page = null,
    pageSize = null,
    limit = null,
    total = {},
    single = false,
    search = null,
    lte = {},
    gte = {},
  } = cleanOptions;

  try {
    let query = supabase.from(table).select(select, total);

    // Apply filters
    Object.entries(filters).forEach(([column, value]) => {
      query = Array.isArray(value)
        ? query.in(column, value)
        : query.eq(column, value);
    });

    // Apply not equals
    Object.entries(notEquals).forEach(([column, value]) => {
      query = query.neq(column, value);
    });

    // Improved search: support multiple columns
    if (Array.isArray(search) && search.length > 0) {
      if (search.length === 1) {
        // Single search condition
        const { column, query: q } = search[0];
        query = query.ilike(column, `%${q}%`);
      } else {
        // Multiple search conditions - use OR logic
        const orConditions = search
          .map(({ column, query: q }) => `${column}.ilike.%${q}%`)
          .join(",");

        query = query.or(orConditions);
      }
    }

    // Apply lte (less than or equal) for multiple columns
    if (lte && typeof lte === "object") {
      Object.entries(lte).forEach(([column, value]) => {
        query = query.lte(column, value);
      });
    }

    // Apply gte (greater than or equal) for multiple columns
    if (gte && typeof gte === "object") {
      Object.entries(gte).forEach(([column, value]) => {
        query = query.gte(column, value);
      });
    }

    // Apply sorting
    if (sort) {
      const [column, order] = sort;
      query = query.order(column, { ascending: order === "asc" });
    }

    // Apply pagination
    if (page !== null && pageSize !== null) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      console.log(
        `Pagination applied: range(${from}, ${to}), page=${page}, pageSize=${pageSize}`
      );
      query = query.range(from, to);
    }

    // Apply limit
    if (limit !== null) {
      query = query.limit(limit);
    }

    // Execute query
    const { data, error, count } = single ? await query.single() : await query;

    // Handle errors
    if (error) {
      console.error(`Error fetching data from ${table}:`, error.message);
      return {
        success: false,
        message: error.message,
      };
    }

    // Return successful result
    return {
      success: true,
      data: data,
      count: count ?? 0,
    };
  } catch (error) {
    console.error(
      `Unexpected error fetching data from ${table}:`,
      error.message
    );
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function saveData(table, data) {
  try {
    // Insert the data into the specified table
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) {
      console.error(`Error saving data to ${table}:`, error);
      return {
        success: false,
        error: error.message,
        details: error.details,
      };
    }

    return {
      success: true,
      data: result[0], // Return the first inserted row
    };
  } catch (error) {
    console.error(`Exception saving data to ${table}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get debug information about a query for testing/debugging purposes
 * @param {string} table The table name to query
 * @param {object} options Query options including filters, pagination, sorting
 * @returns {object} An object representing the query structure
 */
export function getQueryDebugInfo(table, options = {}) {
  const {
    select = "*",
    filters = {},
    notEquals = {},
    sort = null,
    page = null,
    pageSize = null,
    limit = null,
    search = null,
    lte = {},
    gte = {},
  } = options;

  // Build a representation of the query for debugging
  const queryInfo = {
    table,
    select,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    notEquals: Object.keys(notEquals).length > 0 ? notEquals : undefined,
    search: search?.length ? search : undefined,
    lte: Object.keys(lte).length > 0 ? lte : undefined,
    gte: Object.keys(gte).length > 0 ? gte : undefined,
    sort,
    pagination:
      page !== null && pageSize !== null ? { page, pageSize } : undefined,
    limit: limit !== null ? limit : undefined,
  };

  return queryInfo;
}

export async function updateData(table, data, filters) {
  if (!filters || Object.keys(filters).length === 0) {
    console.error(`Error updating data in ${table}: No filters provided.`);
    return {
      success: false,
      error: "Update operation requires at least one filter.",
    };
  }

  try {
    let query = supabase.from(table).update(data);

    // Apply all filters from the filters object
    Object.entries(filters).forEach(([column, value]) => {
      query = query.eq(column, value);
    });

    const { data: result, error } = await query.select();

    if (error) {
      console.error(`Error updating data in ${table}:`, error);
      return {
        success: false,
        error: error.message,
        details: error.details,
      };
    }

    return {
      success: true,
      // Supabase returns an array of updated rows. We often want the first one.
      data: result && result.length > 0 ? result[0] : null,
    };
  } catch (error) {
    console.error(`Exception updating data in ${table}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}
