import { useState } from "react";
import { Button, Typography, Space, Input } from "antd";

const { Title, Text, Link } = Typography;

export default function CreateAccountForm() {
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [firstName, setFirstName] = useState("Huy");
  const [lastName, setLastName] = useState("Đoàn");
  const [email, setEmail] = useState("phamhoangduc2004@gmail.com");
  const [userName, setUserName] = useState("Huy Đoàn");

  const handleChange = () => {
    setShowChangeForm(true);
  };

  const handleCreateAccount = () => {
    if (showChangeForm) {
      setUserName(`${firstName} ${lastName}`);
      setShowChangeForm(false);
    } else {
      console.log("Creating account with:", { email, userName });
    }
  };

  return (
    <div className="min-h-[80vh] bg-white flex justify-center p-4">
      <div className="w-full max-w-md">
        <Space direction="vertical" size="large" className="w-full">
          {/* Header */}
          <div className="text-center">
            <Title level={2} className="m-0">
              Create an account
            </Title>
            <Text type="secondary" className="block mt-2">
              We'll use your Google details to create your eBay account
            </Text>
          </div>

          {/* Conditional Rendering */}
          {!showChangeForm ? (
            <>
              {/* User Info Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <Space direction="vertical" size="small" className="w-full">
                  <div>
                    <Text strong>{userName}</Text>
                  </div>
                  <Text type="secondary" className="text-sm">
                    {email}
                  </Text>
                  <Link underline className="text-blue-600" onClick={handleChange}>
                    Change
                  </Link>
                </Space>
              </div>

              {/* Already using eBay Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <Space direction="vertical" size="small" className="w-full">
                  <Text>
                    Already using eBay?{" "}
                    <Link underline className="text-blue-600">
                      Link to an existing account
                    </Link>
                  </Text>
                </Space>
              </div>
            </>
          ) : (
            <>
              {/* Form Inputs */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First name
                  </label>
                  <Input
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last name
                  </label>
                  <Input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Already using eBay Section */}
              <Text type="secondary" className="text-sm">
                Already using eBay?{" "}
                <Link underline className="text-blue-600">
                  Link to an existing account
                </Link>
              </Text>
            </>
          )}

          {/* Agreement Text */}
          <Text type="secondary" className="text-xs block">
            By Creating an account, you agree to our{" "}
            <Link underline className="text-blue-600">
              User Agreement
            </Link>{" "}
            and acknowledge our{" "}
            <Link underline className="text-blue-600">
              User Privacy Notice
            </Link>
            .
          </Text>

          {/* Create Account Button */}
          <Button
            type="primary"
            size="large"
            block
            onClick={handleCreateAccount}
            className="bg-blue-600 hover:bg-blue-700 h-12 rounded-full font-semibold"
          >
            {showChangeForm ? "Create account" : "Create account"}
          </Button>
        </Space>
      </div>
    </div>
  );
}