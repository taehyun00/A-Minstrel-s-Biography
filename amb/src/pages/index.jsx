import '../App.css'
import buttons from '../assets/button.svg'
import { NavLink } from 'react-router-dom'


function Index() {
    return(
    <div className='title_div'>
       <p className='title'>어느 음유시인 이야기</p>
       <NavLink to='/intro'><img src={buttons}/></NavLink>
    </div>
    )
}

export default Index
