import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "./CartContext";
import "./Mode.css";

export default function CardButtons() {
  const navigate = useNavigate();
  const { changePriceType } = useContext(CartContext);

  const handleCardClick = (priceType) => {
    changePriceType(priceType); // Update price type globally
    localStorage.setItem("priceType", priceType); // Store priceType in localStorage
    navigate("/home", { state: { priceType } }); // Pass priceType in state
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