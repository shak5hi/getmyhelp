import React from "react";
import { Text as RNText, TextProps as RNTextProps, TextInput as RNTextInput, TextInputProps as RNTextInputProps } from "react-native";
import { fonts } from "../../constants/tokens";

export type TextProps = RNTextProps;
export type TextInputProps = RNTextInputProps;

// The imperative handle a `ref` on our TextInput resolves to — the underlying RN
// element, not this wrapper. Call sites need this for `useRef<…>(null)`.
export type TextInputHandle = RNTextInput;

export function Text(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <RNText
      style={[{ fontFamily: fonts.regular }, style]}
      {...rest}
    />
  );
}

// Forward ref is necessary for TextInput so that callers can manage focus
export const TextInput = React.forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  const { style, ...rest } = props;
  return (
    <RNTextInput
      ref={ref}
      style={[{ fontFamily: fonts.regular }, style]}
      {...rest}
    />
  );
});


TextInput.displayName = "TextInput";
