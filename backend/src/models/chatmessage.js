const pool = require("../config/db.js");

function normalizeIds(idA, idB) {
  return idA < idB ? [idA, idB] : [idB, idA];
}

exports.findOrCreateConversation = async (userIdA, userIdB) => {
  const [userOne, userTwo] = normalizeIds(userIdA, userIdB);

  const [existing] = await pool.query(
    "SELECT * FROM conversations WHERE user_one_id = ? AND user_two_id = ?",
    [userOne, userTwo]
  );
  if (existing.length > 0) return existing[0];

  const [result] = await pool.query(
    "INSERT INTO conversations (user_one_id, user_two_id) VALUES (?, ?)",
    [userOne, userTwo]
  );
  return { id: result.insertId, user_one_id: userOne, user_two_id: userTwo };
};

exports.getUserConversations = async (userId) => {
  const [rows] = await pool.query(
    `SELECT c.id AS conversation_id,
            CASE WHEN c.user_one_id = ? THEN c.user_two_id ELSE c.user_one_id END AS other_user_id,
            u.name AS other_user_name,
            u.avatar_url AS other_user_avatar,
            c.last_message_at
     FROM conversations c
     JOIN users u ON u.id = CASE WHEN c.user_one_id = ? THEN c.user_two_id ELSE c.user_one_id END
     WHERE c.user_one_id = ? OR c.user_two_id = ?
     ORDER BY c.last_message_at DESC`,
    [userId, userId, userId, userId]
  );
  return rows;
};

exports.getMessages = async (conversationId, limit = 50) => {
  const [rows] = await pool.query(
    `SELECT dm.id, dm.sender_id, dm.content, dm.created_at, u.name AS sender_name
     FROM dm_messages dm
     JOIN users u ON u.id = dm.sender_id
     WHERE dm.conversation_id = ?
     ORDER BY dm.created_at ASC
     LIMIT ?`,
    [conversationId, limit]
  );
  return rows;
};

exports.saveMessage = async (conversationId, senderId, content) => {
  const [result] = await pool.query(
    "INSERT INTO dm_messages (conversation_id, sender_id, content) VALUES (?, ?, ?)",
    [conversationId, senderId, content]
  );

  await pool.query(
    "UPDATE conversations SET last_message_at = NOW() WHERE id = ?",
    [conversationId]
  );

  return { id: result.insertId, conversation_id: conversationId, sender_id: senderId, content };
};