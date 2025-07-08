import * as React from "react";

// 아주 기본적인 Input 컴포넌트 - 스타일 없이 입력만 정상 동작하는지 확인
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input ref={ref} {...props} />
);
Input.displayName = "Input"; 