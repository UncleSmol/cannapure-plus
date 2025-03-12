import React, { useState, useEffect } from "react";
import "./StrainCard.css";
import logoPlaceholder from "../../assets/images/cannipure-logo.png";
import { fetchAllStrains } from "./StrainDataService";

const StrainCardList = () => {
  const [strains, setStrains] = useState([]);

  useEffect(() => {
    const loadStrains = async () => {
      const strainsData = await fetchAllStrains();
      setStrains(strainsData);
    };
    loadStrains();
  }, []);

  return (
    <div className="strain-card-container">
      {strains.map(strain => (
        <StrainCard key={strain.id} {...strain} />
      ))}
    </div>
  );
};

const StrainCard = ({
  id,
  name,
  type,
  image,
  // thc,
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

        {/* {thc && (
          <div className="strain-card__thc-content">
            <span className="strain-card__thc-label">THC:</span>
            <span className="strain-card__thc-value">{thc}</span>
          </div>
        )} */}

        <div className="strain-card__price-holder">
          <span className="strain-card__price">R{price}</span>
          <span className="strain-card__measurement">/g</span>
        </div>
      </div>

      <div className="strain-card__indicator"></div>
    </div>
  );
};

export { StrainCardList, StrainCard };
