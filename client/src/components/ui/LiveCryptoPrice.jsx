import { memo } from "react";
import useLiveCryptoPrice from "../../hooks/useLiveCryptoPrice";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import ThreeDotLoader from "./ThreeDotLoader";

const LiveCryptoPrice = ({ coinName, c = true, text = "13px" }) => {
  const { priceFormat, priceColor, changeInPriceFormat } = useLiveCryptoPrice(coinName);

  const signal =
    priceColor === "text-green-500" ? (
      <FaArrowUp className="text-green-500 text-xs" />
    ) : priceColor === "text-red-500" ? (
      <FaArrowDown className="text-red-500 text-xs" />
    ) : null;

  if (!priceFormat) {
    return <ThreeDotLoader />;
  }

  return (
<p
  style={{ fontSize: text }}
  className={`font-mono flex items-center gap-1 ${priceColor} transition-colors duration-300`}
>
  {c ? (
    <>
      {priceFormat}
      {signal}
    </>
  ) : (
    changeInPriceFormat
  )}
</p>


  );
};

export default memo(LiveCryptoPrice);
