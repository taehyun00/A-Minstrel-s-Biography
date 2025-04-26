import { NavLink } from 'react-router-dom'
import '../App.css'



function Start() {
    return(
    <div className='title_div'>
       <p className='title'>스토리</p>
       <div className='title_des'>
       <p>당신은 용사 파티의 이야기를 써내려가는 음유시인입니다.</p>
       <p>하지만 이번 용사파티는 게으르군요.</p>
       <p>용사파티가 한심해진 당신은 직접 마왕을 헤치우고자합니다.</p>
       <p>하지만 음유시인인 당신이 할수있는것은 그저 신비로운 힘을 가진 음악을 하는것</p>
       <p>신비로운 음악으로 마왕을 무찔러봅시다!</p>

       <NavLink to="/main"><button className='title_button'>다음</button></NavLink>
       </div>
      
      

    </div>
    )
}

export default Start
