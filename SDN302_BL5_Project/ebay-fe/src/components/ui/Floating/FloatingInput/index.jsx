import { Input, InputNumber } from "antd"
import classNames from "classnames"
import PropTypes from "prop-types"
import "./FloatingInput.scss"

const { TextArea, Search, Password } = Input

const FloatingInput = ({ label, type = "default", onChange, ...rest }) => {
  const commonProps = {
    ...rest,
    placeholder: label ? " " : rest.placeholder,
    onChange,
  }

  let Component
  switch (type) {
    case "textarea":
      Component = TextArea
      break
    case "number":
      Component = InputNumber
      commonProps.onChange = val => onChange?.({ target: { value: val } })
      break
    case "search":
      Component = Search
      break
    case "password":
      Component = Password
      break
    case "otp":
      Component = Input
      commonProps.type = "text"
      commonProps.inputMode = "numeric"
      commonProps.maxLength = rest.maxLength || 6
      break
    default:
      Component = Input
      commonProps.type = type
  }

  return (
    <div className={classNames("floating-label-input-antd-container", {})}>
      <Component {...commonProps} />
      <label className="floating-label">{label}</label>
    </div>
  )
}

FloatingInput.propTypes = {
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  type: PropTypes.oneOf([
    "default",
    "textarea",
    "number",
    "search",
    "password",
    "otp",
  ]),
}

export default FloatingInput
