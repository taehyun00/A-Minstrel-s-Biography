import Navi from "./navi";
import '../App.css'

function Mains() {
    return(
    <div className='title_div'>
        <p className='title'>광장</p>
        <div className='title_des'>
            <p>당신앞에는 커다랗게 형성된 도시의 광장이 보입니다.</p>
            <p>이 광장에선 여러 업무를 볼수있는것처럼 보입니다.</p>
            <p>-덱-</p>
            <p>자신의 노래를 정비할수있습니다.</p>
            <p>-모험-</p>
            <p>마왕을 무찌르러 모험을 떠납니다.</p>
            <p>-광장-</p>
            <p>언제든지 이곳으로 돌아옵니다.</p>
        </div>
        <Navi />
    </div>
    )
}

export default Mains
