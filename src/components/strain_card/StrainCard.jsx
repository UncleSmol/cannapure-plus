import React from "react";
import "./StrainCard.css";
import logoPlaceholder from "../../assets/images/cannapure-plus-logo.png"; // Adjust the path as needed

const StrainCard = ({
  id,
  name,
  type,
  image,
  price,
  description,
  isSpecial = false,
}) => {
  return (
    <div className={`strain-card ${isSpecial ? "special-card" : ""}`}>
      <div className="strain-card__image-holder">
        {image ? (
          <img src={image} alt={name} className="strain-card__image" />
        ) : (
          <img
            src={logoPlaceholder}
            alt={`${name} placeholder`}
            className="strain-card__image strain-card__placeholder"
          />
        )}
      </div>

      <div className="strain-card__content">
        <div className="strain-card__header">
          <h3 className="strain-card__name">{name}</h3>
          <span className="strain-card__type">{type}</span>
        </div>

        {description && (
          <p className="strain-card__description">{description}</p>
        )}

        <div className="strain-card__price-holder">
          <span className="strain-card__price">R{price}</span>
          <span className="strain-card__measurement">/g</span>
        </div>
      </div>

      <div className="strain-card__indicator"></div>
    </div>
  );
};

export default StrainCard;
