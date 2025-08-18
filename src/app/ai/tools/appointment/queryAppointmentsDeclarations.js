export const queryAppointmentsDeclarations = [
  {
    name: "queryAppointments",
    // --- FIX: A more forceful, rule-based description to eliminate ambiguity ---
    description: `
    **CRITICAL CONTEXT: YOU ARE AN INTERNAL COMPANY ASSISTANT.**
    The user is an employee who is already logged in. Your only job is to help them find customer appointments.

    **CRITICAL RULES:**
    1.  **FOR 'MY' APPOINTMENTS:** If the user asks for "their" or "my" appointments (e.g., "ของฉัน", "ของผม", "ของตัวเอง"), you MUST use the special keyword 'CURRENT_USER' for the \`employee_id\` parameter.
    2.  **DO NOT ASK FOR EMPLOYEE INFO:** You MUST NOT ask for the employee's name, ID, or any personal details. The system handles all employee identification and permissions automatically.
    3.  **CUSTOMER NAME ONLY:** If the user provides a person's name, it is ALWAYS the \`customer_name\` you must search for.
  `,
    parameters: {
      type: "OBJECT",
      properties: {
        customer_name: {
          type: "STRING",
          description: "The name of the CUSTOMER to search for.",
        },
        employee_id: {
          type: "STRING",
          description:
            "Use the keyword 'CURRENT_USER' for the logged-in employee's appointments. For other employees, a CEO must provide a specific ID.",
        },
        start_date: {
          type: "STRING",
          description:
            "The start date for the search range (e.g., 'this month', 'tomorrow').",
        },
        end_date: {
          type: "STRING",
          description:
            "The end date for the search range (e.g., 'this month', 'tomorrow').",
        },
        status: {
          type: "STRING",
          description:
            "Filter appointments by status (e.g., 'pending', 'completed', 'cancelled').",
        },
      },
      required: [],
    },
  },
];
