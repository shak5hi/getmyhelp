import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { makeStyles } from "../../styles/society.styles";
import { useTheme } from "../../src/ThemeContext";

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
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={[styles.commentBubble, isMe ? styles.myComment : styles.otherComment]}>
      {!isMe && (
        <Text style={[styles.statusText, { color: theme.textTertiary, marginBottom: 4, fontSize: 9 }]}>
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
