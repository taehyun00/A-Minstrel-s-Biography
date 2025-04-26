import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 페이지 컴포넌트 import
import Index from './index.jsx';
import Start from './start.jsx';


function Router() {
    return(
     <Routes>
        <Route path='/'element={<Index />}/>
        <Route path='/start'element={<Start />}/>
    </Routes>
    )
  }

export default Router;
