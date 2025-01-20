import React, { useEffect, useState } from 'react';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('http://localhost:4001/api/getMenuItems');
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {menuItems.map((menuItem) => (
        <div key={menuItem.id} className="menu-item">
          <h3>{menuItem.name}</h3>
          <img src={menuItem.img} alt={menuItem.name} />
          <p>{menuItem.description}</p>
          <p>Price: {menuItem.price}</p>
          <ul>
            {menuItem.addOns.map((addOn, index) => (
              <li key={index}>
                {addOn.name} - {addOn.price}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Menu;
