import { useState, useEffect } from 'react';
import '../App.css';
import Navi from './navi';

function Deck() {
    const initialSongs = ["상어의 노래", "치유의 노래", "사자의 노래", "스튜의 노래", "용사의 노래"];

    const [deck, setDeck] = useState([]);
    const [nousedeck, setNousedeck] = useState([]);

    useEffect(() => {
        try {
            const savedDeck = sessionStorage.getItem('myDeck');
            const savedNoDeck = sessionStorage.getItem('myNoDeck');

            if (savedDeck) {
                const parsedDeck = JSON.parse(savedDeck);
                if (Array.isArray(parsedDeck)) {
                    setDeck(parsedDeck);
                    console.log("가져온 덱:", parsedDeck);
                } else {
                    console.warn("myDeck 값이 배열이 아님. 초기화함.");
                    const defaultDeck = [];
                    setDeck(defaultDeck);
                    sessionStorage.setItem('myDeck', JSON.stringify(defaultDeck));
                }
            } else {
                const defaultDeck = [];
                setDeck(defaultDeck);
                sessionStorage.setItem('myDeck', JSON.stringify(defaultDeck));
            }

            if (savedNoDeck) {
                const parsedNoDeck = JSON.parse(savedNoDeck);
                if (Array.isArray(parsedNoDeck) && parsedNoDeck.length > 0) {
                    setNousedeck(parsedNoDeck);
                } else {
                    setNousedeck(initialSongs);
                    sessionStorage.setItem('myNoDeck', JSON.stringify(initialSongs));
                }
            } else {
                setNousedeck(initialSongs);
                sessionStorage.setItem('myNoDeck', JSON.stringify(initialSongs));
            }
        } catch (error) {
            console.error('세션 불러오기 에러:', error);
            setDeck([]);
            setNousedeck(initialSongs);
            sessionStorage.setItem('myDeck', JSON.stringify([]));
            sessionStorage.setItem('myNoDeck', JSON.stringify(initialSongs));
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('myDeck', JSON.stringify(deck));
        console.log('deck이 변경되었습니다:', deck);
    }, [deck]);

    useEffect(() => {
        sessionStorage.setItem('myNoDeck', JSON.stringify(nousedeck));
    }, [nousedeck]);

    const listdown = (item) => {
        setDeck(prev => prev.filter(i => i !== item));
        setNousedeck(prev => [...prev, item]);
    };

    const listup = (item) => {
        setNousedeck(prev => prev.filter(i => i !== item));
        setDeck(prev => [...prev, item]);
    };

    return (
        <div className='title_div'>
            <p className='title'>덱</p>
            <div className='title_des'>
                <p>현재 덱</p>
                <br />
                <div className='title_des_deck'>
                    {deck.length > 0 ? (
                        deck.map((item, index) => (
                            <button onClick={() => listdown(item)} key={item}>
                                <p>{index + 1}.{item}</p>
                            </button>
                        ))
                    ) : (
                        <p>현재 덱이 비어 있습니다.</p>
                    )}
                </div>
                <p>보유 노래</p>
                <div className='title_des_deck'>
                    {nousedeck.length > 0 ? (
                        nousedeck.map((item, index) => (
                            <button onClick={() => listup(item)} key={item}>
                                <p>{index + 1}.{item}</p>
                            </button>
                        ))
                    ) : (
                        <p>보유 노래가 없습니다.</p>
                    )}
                </div>
            </div>
            <Navi />
        </div>
    );
}

export default Deck;
