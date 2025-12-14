'use client'

import { Input, InputNumber } from "antd"
import PropTypes from "prop-types"
import { useRef } from "react"

const OtpInput = ({ length = 6, onChange }) => {
  const inputsRef = useRef([])

  const handleChange = (e, idx) => {
    const value = e.target.value.slice(-1) // chỉ lấy 1 ký tự cuối
    inputsRef.current[idx].value = value

    let code = ""
    inputsRef.current.forEach((input) => (code += input?.value || ""))
    onChange?.(code)

    if (value && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus()
    }
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          type="text"
          maxLength={1}
          ref={(el) => (inputsRef.current[idx] = el)}
          onChange={(e) => handleChange(e, idx)}
          style={{
            width: 40,
            height: 40,
            textAlign: "center",
            fontSize: 18,
            border: "1px solid #000000ff",
            borderRadius: 6,
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#1677ff")}
          onBlur={(e) => (e.target.style.borderColor = "#d9d9d9")}
        />
      ))}
    </div>
  )
}

const typeMap = {
  textarea: Input.TextArea,
  number: InputNumber,
  search: Input.Search,
  password: Input.Password,
  otp: OtpInput, // custom OTP input
  default: Input,
}

const InputCustom = ({
  label = "",
  type = "default",
  floating = false,
  className = "",
  ...rest
}) => {
  const Component = typeMap[type] || Input

  const style = {
    textarea: { minHeight: "80px", overflow: "hidden auto" },
    number: { width: "100%" },
  }

  const baseProps = {
    placeholder: label,
    style: style[type] || {},
    className: `${floating ? "floating-label" : ""} ${className}`.trim(),
  }

  if (type === "search") {
    baseProps.enterButton = true
  }

  return <Component {...baseProps} {...rest} />
}

InputCustom.propTypes = {
  type: PropTypes.oneOf([
    "textarea",
    "number",
    "search",
    "password",
    "otp",
    "default",
  ]),
  label: PropTypes.string,
  floating: PropTypes.bool,
  className: PropTypes.string,
}

export default InputCustom
