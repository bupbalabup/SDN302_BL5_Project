import { useState } from "react";
import { Button, Input, Typography, Space, Select } from "antd";
import { LeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function PhoneVerificationForm() {
  const [phoneNumber, setPhoneNumber] = useState("0987 599 814");
  const [countryCode, setCountryCode] = useState("+84");

  const handleContinue = () => {
    console.log("Phone number:", countryCode + phoneNumber);
    // Xử lý logic tiếp theo ở đây
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="shadow-sm p-8 w-full max-w-md">
        <Space direction="vertical" size="large" className="w-full">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button type="text" icon={<LeftOutlined />} className="p-0" />
            <Title level={3} className="m-0">
              Add your phone number
            </Title>
          </div>

          {/* Description */}
          <Text type="secondary">
            We'll text a security code to your mobile phone to finish setting up
            your account.
          </Text>

          {/* Phone Input */}
          <Space.Compact className="w-full">
            <Select
              value={countryCode}
              onChange={setCountryCode}
              style={{ width: 100 }}
              options={[
                { value: "+84", label: "🇻🇳 +84" },
                { value: "+1", label: "🇺🇸 +1" },
                { value: "+44", label: "🇬🇧 +44" },
                { value: "+86", label: "🇨🇳 +86" },
              ]}
            />
            <Input
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1"
            />
          </Space.Compact>

          {/* Terms Text */}
          <Text type="secondary" className="text-xs">
            By selecting <strong>Continue</strong>, you agree to receive a text
            message with a security code. Standard rates may apply.
          </Text>

          {/* Continue Button */}
          <div class="flex justify-end">
            <button
              class="w-40 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-full transition-colors duration-200"
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </Space>
      </div>
    </div>
  );
}
