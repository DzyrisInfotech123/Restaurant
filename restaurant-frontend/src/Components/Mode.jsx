import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "./CartContext";
import "./Mode.css";

export default function CardButtons() {
  const navigate = useNavigate();
  const { changePriceType } = useContext(CartContext);

  const handleCardClick = (priceType) => {
    changePriceType(priceType); // Update price type globally
    navigate("/home", { state: { priceType } });
    setTimeout(() => {
      window.location.reload(); // Refresh the page after navigation
    }, 50);
  };

  return (
    <div className="card-panel-wrapper">
      <div className="card-panel">
        <div className="card-container">
          <div className="card-button" onClick={() => handleCardClick("sale")}>
            <div className="card-text">Sale Products</div>
          </div>
          <div className="card-button" onClick={() => handleCardClick("purchase")}>
            <div className="card-text">Purchase Products</div>
          </div>
        </div>
      </div>
    </div>
  );
}
