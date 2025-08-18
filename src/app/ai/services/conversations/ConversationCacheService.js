export class ConversationCacheService {
  constructor(config = {}) {
    this.cache = new Map();
    this.maxConversations = config.maxConversations || 500;
    this.maxMessagesPerConversation = config.maxMessages || 8;
    this.conversationTimeout = config.timeout || 15 * 60 * 1000; // 15 minutes
    this.debugMode = config.debugMode || process.env.NODE_ENV === "development";
  }

  /**
   * Smart logging based on environment
   */
  logMessages(userId, messages, action = "Found") {
    if (!this.debugMode) {
      // Production: Simple log
      console.log(
        `[CacheService] ${action} ${messages.length} messages for user ${userId}`
      );
      return;
    }

    // Development: Detailed log
    console.log(
      `[CacheService] ${action} ${messages.length} messages for user ${userId}:`
    );

    if (messages.length > 0) {
      messages.forEach((msg, index) => {
        const content = msg.content || "[No content]";
        const preview =
          content.length > 60 ? content.substring(0, 60) + "..." : content;
        const timestamp = msg.timestamp
          ? ` (${new Date(msg.timestamp).toLocaleTimeString()})`
          : "";

        console.log(
          `  ${
            index + 1
          }. [${msg.role.toUpperCase()}]${timestamp}: "${preview}"`
        );
      });
    }
  }

  /**
   * Get conversation from cache
   */
  getConversation(userId) {
    const conversation = this.cache.get(userId);

    if (!conversation) {
      console.log(`[CacheService] No conversation found for user ${userId}`);
      return { messages: [], lastActivity: Date.now() };
    }

    // Check if conversation is still active
    if (Date.now() - conversation.lastActivity > this.conversationTimeout) {
      console.log(`[CacheService] Conversation expired for user ${userId}`);
      this.cache.delete(userId);
      return { messages: [], lastActivity: Date.now() };
    }

    this.logMessages(userId, conversation.messages, "Found");

    return conversation;
  }

  /**
   * Add message to cache
   */
  addMessage(userId, message) {
    let conversation = this.getConversation(userId);

    conversation.messages.push({
      ...message,
      timestamp: new Date().toISOString(),
    });
    conversation.lastActivity = Date.now();

    // Keep only recent messages in cache
    if (conversation.messages.length > this.maxMessagesPerConversation) {
      conversation.messages = conversation.messages.slice(
        -this.maxMessagesPerConversation
      );
      console.log(
        `[CacheService] Trimmed cache to ${this.maxMessagesPerConversation} messages for user ${userId}`
      );
    }

    this.cache.set(userId, conversation);

    // Cleanup if cache is too large
    if (this.cache.size > this.maxConversations) {
      this.cleanup();
    }

    console.log(
      `[CacheService] Added message for user ${userId}, total: ${conversation.messages.length}`
    );
  }

  /**
   * Get messages only (without metadata)
   */
  getMessages(userId) {
    const conversation = this.getConversation(userId);
    return conversation.messages || [];
  }

  /**
   * Check if user has active conversation
   */
  hasActiveConversation(userId) {
    const conversation = this.cache.get(userId);
    if (!conversation) return false;

    return Date.now() - conversation.lastActivity <= this.conversationTimeout;
  }

  /**
   * Cleanup expired conversations
   */
  cleanup() {
    const now = Date.now();
    const toDelete = [];

    for (const [userId, conversation] of this.cache.entries()) {
      if (now - conversation.lastActivity > this.conversationTimeout) {
        toDelete.push(userId);
      }
    }

    toDelete.forEach((userId) => this.cache.delete(userId));
    if (toDelete.length > 0) {
      console.log(
        `[CacheService] Cleaned up ${toDelete.length} expired conversations`
      );
    }

    return toDelete.length;
  }

  /**
   * Clear specific user cache
   */
  clearUser(userId) {
    const existed = this.cache.has(userId);
    this.cache.delete(userId);
    console.log(
      `[CacheService] Cleared cache for user ${userId}: ${
        existed ? "success" : "not found"
      }`
    );
    return existed;
  }

  /**
   * Clear all cache
   */
  clearAll() {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`[CacheService] Cleared all cache (${count} conversations)`);
    return count;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = {
      totalConversations: this.cache.size,
      maxConversations: this.maxConversations,
      maxMessagesPerConversation: this.maxMessagesPerConversation,
      timeoutMinutes: this.conversationTimeout / 1000 / 60,
      conversations: [],
    };

    // Add detailed conversation stats
    for (const [userId, conversation] of this.cache.entries()) {
      stats.conversations.push({
        userId,
        messageCount: conversation.messages.length,
        lastActivity: new Date(conversation.lastActivity).toISOString(),
        minutesAgo: Math.round(
          (Date.now() - conversation.lastActivity) / 1000 / 60
        ),
      });
    }

    // Sort by most recent activity
    stats.conversations.sort((a, b) =>
      b.lastActivity.localeCompare(a.lastActivity)
    );

    return stats;
  }

  /**
   * Get conversation summary for a user
   */
  getConversationSummary(userId) {
    const conversation = this.cache.get(userId);
    if (!conversation) return null;

    const messages = conversation.messages;
    const userMessages = messages.filter((m) => m.role === "user").length;
    const assistantMessages = messages.filter(
      (m) => m.role === "assistant"
    ).length;

    return {
      userId,
      totalMessages: messages.length,
      userMessages,
      assistantMessages,
      lastActivity: new Date(conversation.lastActivity).toISOString(),
      isActive: this.hasActiveConversation(userId),
      firstMessage:
        messages[0]?.content?.substring(0, 50) + "..." || "No messages",
      lastMessage:
        messages[messages.length - 1]?.content?.substring(0, 50) + "..." ||
        "No messages",
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    if (newConfig.maxConversations)
      this.maxConversations = newConfig.maxConversations;
    if (newConfig.maxMessages)
      this.maxMessagesPerConversation = newConfig.maxMessages;
    if (newConfig.timeout) this.conversationTimeout = newConfig.timeout;

    console.log(`[CacheService] Configuration updated:`, {
      maxConversations: this.maxConversations,
      maxMessages: this.maxMessagesPerConversation,
      timeoutMinutes: this.conversationTimeout / 1000 / 60,
    });
  }
}

// Export singleton instance with default config
export const conversationCache = new ConversationCacheService({
  maxConversations: 500,
  maxMessages: 8,
  timeout: 15 * 60 * 1000, // 15 minutes
});
