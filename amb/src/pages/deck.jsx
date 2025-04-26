import { useState, useEffect } from 'react';
import '../App.css';
import Navi from './navi';

function Deck() {
    const [deck, setDeck] = useState([]);
    const [nousedeck, setNousedeck] = useState([]);

    useEffect(() => {
        // sessionStorage에서 저장된 값이 있으면 가져오고, 없으면 초기값 설정
        const savedDeck = sessionStorage.getItem('myDeck');
        const savedNoDeck = sessionStorage.getItem('myNoDeck');

        if (savedDeck && savedNoDeck) {
            setDeck(JSON.parse(savedDeck));
            setNousedeck(JSON.parse(savedNoDeck));
        } else {
            const initialDeck = ["사자의 노래", "스튜의 노래", "용사의 노래"];
            const initialNoDeck = ["상어의 노래", "치유의 노래"];
            setDeck(initialDeck);
            setNousedeck(initialNoDeck);
           
            sessionStorage.setItem('myDeck', JSON.stringify(initialDeck));
            sessionStorage.setItem('myNoDeck', JSON.stringify(initialNoDeck));
        }
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.removeItem('myDeck');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const addSong = (song) => {
        const updatedDeck = [...deck, song];
        setDeck(updatedDeck);
        sessionStorage.setItem('myDeck', JSON.stringify(updatedDeck));
    };

    const listdown = (item) => {
        const updatedDecks = [...nousedeck, item];
        setNousedeck(updatedDecks);
        sessionStorage.setItem('myNoDeck', JSON.stringify(updatedDecks));
        const newdeck = deck.filter((i) => i !== item);
        setDeck(newdeck);
        console.log("보관덱 " + nousedeck)
    };

    const listup = (item) => {
        const updatedDecks = [...deck, item];
        setDeck(updatedDecks);
        sessionStorage.setItem('myDeck', JSON.stringify(updatedDecks));
        const newdeck = nousedeck.filter((i) => i !== item);
        setNousedeck(newdeck);
        console.log("덱" + deck)
    };

    let i = 0;
    let j = 0;

    return (
        <div className='title_div'>
            <p className='title'>덱</p>
            <div className='title_des'>
                <p>현재 덱</p>
                <br />
                <div className='title_des_deck'>
                    {deck.map((item, index) => (
                        <button onClick={() => listdown(item)} key={index}><p>{++i}.{item}</p></button>
                    ))}
                </div>
                <p>보유 노래</p>
                <div className='title_des_deck'>
                    {nousedeck.map((item, index) => (
                        <button onClick={() => listup(item)} key={index}><p>{++j}.{item}</p></button>
                    ))}
                </div>
            </div>
            <Navi />
        </div>
    );
}

export default Deck;
