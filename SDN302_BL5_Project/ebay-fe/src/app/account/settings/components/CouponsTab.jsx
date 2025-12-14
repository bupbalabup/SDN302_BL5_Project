import { Card, Row, Col, Typography, Tag, Button } from "antd";
import styles from "../AccountSettings.module.scss";
import { useEffect, useState } from "react";
import { getUserCoupons } from "@/services/userService";
import Loading from "@/components/shared/Loading";
import { formatDate } from "@/lib/utils";

const { Title, Text } = Typography;

const CouponsTab = ({ onCopyCode }) => {
  const [myCoupons, setMyCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await getUserCoupons();
      setMyCoupons(data.myCoupons);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);
  if (loading) return <Loading />;
  return (
    <Card className={styles.mainCard} title="My Coupons">
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">You have {myCoupons.length} active coupons</Text>
      </div>

      <Row gutter={[16, 16]}>
        {myCoupons.map((coupon) => (
          <Col xs={24} key={coupon._id}>
            <Card
              className={`${styles.couponCard} ${
                coupon.status === "expired" ? styles.expiredCoupon : ""
              }`}
              styles={{
                body: { padding: 20 },
              }}
            >
              <Row align="middle" gutter={16}>
                <Col xs={24} sm={6}>
                  <div className={styles.couponDiscount}>
                    <div className={styles.discountAmount}>
                      {coupon.discountPercent + "%"}
                    </div>
                    <div className={styles.discountLabel}>OFF</div>
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className={styles.couponInfo}>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      Applicable for orders from {coupon.minOrderValue} VND
                    </Title>

                    <p>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Expires at: {formatDate(coupon.endDate)}
                      </Text>
                    </p>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={coupon.status === "active" ? "green" : "red"}>
                        {coupon.status === "active" ? "Active" : "Expired"}
                      </Tag>

                      <Tag
                        color={
                          coupon.type === "new-user"
                            ? "blue"
                            : coupon.type === "product"
                            ? "orange"
                            : "purple"
                        }
                      >
                        {coupon.type === "new-user"
                          ? "Welcome new customers"
                          : coupon.type === "product"
                          ? "Some products" 
                          : coupon.type === "global"
                          ? "All products"
                          : "By category"}
                      </Tag>
                    </div>
                  </div>
                </Col>

                <Col xs={24} sm={6} style={{ textAlign: "right" }}>
                  <div className={styles.couponCode}>
                    <Text strong style={{ fontSize: 14 }}>
                      {coupon.code}
                    </Text>
                  </div>

                  {coupon.status === "active" && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ marginTop: 8, width: "100%" }}
                      onClick={() => onCopyCode(coupon.code)}
                    >
                      Copy Code
                    </Button>
                  )}
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default CouponsTab;
