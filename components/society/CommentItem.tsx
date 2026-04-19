import React from "react";
import { View, Text } from "react-native";
import { societyStyles as styles } from "../../styles/society.styles";

interface CommentProps {
  text: string;
  timestamp: string;
  isMe: boolean;
  authorName: string;
}

export const CommentItem: React.FC<CommentProps> = ({
  text,
  timestamp,
  isMe,
  authorName,
}) => {
  return (
    <View style={[styles.commentBubble, isMe ? styles.myComment : styles.otherComment]}>
      {!isMe && (
        <Text style={[styles.statusText, { color: "#6366F1", marginBottom: 4, fontSize: 9 }]}>
          {authorName}
        </Text>
      )}
      <Text style={[styles.commentText, isMe ? styles.myCommentText : styles.otherCommentText]}>
        {text}
      </Text>
      <Text style={[styles.commentTime, isMe ? styles.myCommentTime : styles.otherCommentTime]}>
        {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  );
};
