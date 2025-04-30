import React from 'react';
import { NavLink } from 'react-router-dom';
import '../Navbar.css';

const Navbar = () => {
    return (
        <nav>
            <ul>
                <li><NavLink to="/" end>Типы произведений</NavLink></li>
                <li><NavLink to="/properties">Свойства</NavLink></li>
                <li><NavLink to="/possible-values">Возможные значения</NavLink></li>
                <li><NavLink to="/type-properties">Описание свойств типа</NavLink></li>
                <li><NavLink to="/property-values">Значения для типа</NavLink></li>
                <li><NavLink to="/completeness-check">Проверка полноты</NavLink></li>
                <li><NavLink to="/inference">Ввод исходных данных</NavLink></li>
            </ul>
        </nav>
    );
};

export default Navbar;