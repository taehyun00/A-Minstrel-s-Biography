import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 페이지 컴포넌트 import
import Index from './index.jsx';
import Start from './start.jsx';
import Mains from './mains.jsx';
import Deck from './deck.jsx';
import Adv from './adventure.jsx';

function Router() {
    return(
     <Routes>
        <Route path='/'element={<Index />}/>
        <Route path='/intro'element={<Start />}/>
        <Route path='/main'element={<Mains />}/>
        <Route path='/deck'element={<Deck />}/>
        <Route path='/adventure'element={<Adv />}/>
    </Routes>
    )
  }

export default Router;
