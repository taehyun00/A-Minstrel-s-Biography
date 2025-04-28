import { useState } from 'react';
import '../App.css'
import Navi from './navi';


function Adv() {
    const sen = ['당신은 모험을 떠났다','당신은 몬스터를 조우했다! 어떻게 할까?','당신은 모험가를 조우했다! 어떻게 할까?','당신은 방랑상인을 조우했다! 어떻게 할까?']
    const [idx,plusidx] = useState(0)

    const plus = () =>{
        if(idx == 0){
        const num = Math.floor(Math.random() * 3) + 1;
        plusidx(num)
        }
        else if(idx <= 3){
            plusidx(idx+1)
        }
        
    }
    return(
    <div className='title_div'>
         <p className='title'>모험</p>
         <div className='title_des'>
         <p>{sen[idx]}</p>
         {idx < 2&& (
         <button onClick={plus}>다음</button>
         )}
         
         {idx > 0 && idx<=3 &&(
            <div className='tilte_des'>
            <button>전투</button>
            <button>도망가기</button>
            </div>
         )}
         </div>
        <Navi />
    </div>
    )
}

export default Adv
