import { useState } from "react";

function Comment({ comment, addReply, deleteComment }) {
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);

  return (
    <div style={{ marginLeft: "20px", marginTop: "10px" }}>
      <p>{comment.text}</p>

      <button onClick={() => setShowReply(!showReply)}>Reply</button>
      <button onClick={() => deleteComment(comment.id)}>Delete</button>

      {showReply && (
        <div>
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button
            onClick={() => {
              addReply(comment.id, replyText);
              setReplyText("");
              setShowReply(false);
            }}
          >
            Add Reply
          </button>
        </div>
      )}

      {/* 🔁 RECURSION */}
      {comment.replies.map((reply) => (
        <Comment
          key={reply.id}
          comment={reply}
          addReply={addReply}
          deleteComment={deleteComment}
        />
      ))}
    </div>
  );
}

export default Comment;