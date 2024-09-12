import './App.css';

import FirstSideBar from './layout/FirstSideBar';
import MainContent from './layout/MainContent';
import SecondSideBar from './layout/SecondSideBar';

function App() {
	return (
		<div className='layout'>
			<FirstSideBar />
			<SecondSideBar />
			<MainContent />
		</div>
	);
}

export default App;
