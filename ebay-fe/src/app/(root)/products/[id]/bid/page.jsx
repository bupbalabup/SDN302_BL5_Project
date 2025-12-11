"use client";

import AuctionPage from "@/components/ui/Auction/AuctionPage";
import { useParams } from "next/navigation";

const BidPage = () => {
  const params = useParams();
  const productId = params?.id; // /products/[id]/bid

  if (!productId) {
    return <div className="p-6">Không tìm thấy productId trên URL.</div>;
  }

  return <AuctionPage productId={productId} />;
};

export default BidPage;
