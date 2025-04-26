import '../App.css'
import { NavLink } from 'react-router-dom'


function Navi() {
    return(
    <div className='navi'>
    <NavLink to="/main" className="nav-link">
        <h4>광장</h4>
    </NavLink>
    <NavLink to="/deck" className="nav-link">
        <h4>덱</h4>
    </NavLink>
    <NavLink to="/adventure" className="nav-link">
        <h4>모험</h4>
    </NavLink>
    </div>
    )
}

export default Navi
