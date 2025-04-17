import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

function Schedule() {
  const [animeSchedule, setAnimeSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimeSchedule = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('https://api.jikan.moe/v4/schedules');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAnimeSchedule(data.data);
      } catch (err) {
        setError('Failed to load anime schedule.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimeSchedule();  
    
  }, [ ]);


  const groupAnimeByDay = () => {
    const grouped = {};
    animeSchedule.forEach((anime) => {
      const day = anime.broadcast?.day || 'Unknown';
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(anime);
    });
    return grouped;
  };

  const animeByDay = groupAnimeByDay();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday','Unknown'];

  if (error) {
    return (
      <div className="App">
        <h1>Upcoming Anime Schedule</h1>
        <p>{error}</p>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="App">
        <h1>Upcoming Anime Schedule</h1>
        <p>Loading...</p>
      </div>
    );

  }

  return (
    <div className="App">
      <h1>Upcoming Anime Schedule</h1>
      <div className="schedule-container">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-section">
            <h2>{day}</h2>
            <div className="anime-schedule">
              {animeByDay[day] ? (
                animeByDay[day].map((anime) => (
                  <div key={anime.mal_id} className="anime-item">
                    <img src={anime.images.jpg.image_url} alt={anime.title} className="anime-image" />
                    <h2>{anime.title}</h2>
                    <p>
                      <b>Release Date:</b> {anime.broadcast?.time || 'Not Announced'}
                    </p>
                  </div>
                ))
              ) : (
                <p>No anime scheduled for {day}.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopAiringCarousel({ isLoading, error }) {
    const [topAiring, setTopAiring] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [numberOfElements, setNumberOfElements] = useState(0);
    const [changeElement, setChangeElement] = useState(false);

    let lastFetchTime = 0;
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (!isLoading || hasFetched) return;
        const fetchTopAiring = async () => {
            const currentTime = Date.now();
            if (currentTime - lastFetchTime < 5000) { // 5 seconds threshold
                return;
            }
            lastFetchTime = currentTime;


            const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing')
            const data = await response.json();
             setTopAiring(data.data);
             if(data.data){
               setNumberOfElements(data.data.length);
               if(data.data.length > 1){
                 setChangeElement(true)
               }
               else setChangeElement(false)
             }          
          };
         setHasFetched(true)
          
          
          fetchTopAiring();
    },[isLoading, hasFetched])
    useEffect(() => {
      if (!topAiring || numberOfElements <= 1) return;
      
      const intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % numberOfElements);
      }, 3000);
      return () => clearInterval(intervalId);
    }, [changeElement, numberOfElements, topAiring]);

  if (isLoading) return <p>Loading top airing anime...</p>;
  if (error) return <p>{error}</p>;
  if (!topAiring || numberOfElements === 0) return <p>No airing anime found.</p>;
  
  return (
    numberOfElements > 0 && (
      
    
      <div className="carousel-container">
        {topAiring[currentIndex] &&

        <img src={topAiring[currentIndex].images.jpg.large_image_url} alt={topAiring[currentIndex].title} className="carousel-image" />
        }
        {topAiring[currentIndex] &&
        <h3 className='carousel-title'>{topAiring[currentIndex].title}</h3>}
      </div>)
    );
  }

function PopularAnime({ isLoading, error:setError }) {
  const [popularAnime, setPopularAnime] = useState([]);

  useEffect(() => {
    if(!isLoading) return

    const fetchPopularAnime = async () => {      
       try {
        const response = await fetch('https://api.jikan.moe/v4/top/anime')
        const data = await response.json();        
        setPopularAnime(data.data)
       } catch (err) {
        setError(err.message);
      }
      };
    fetchPopularAnime();
  },[isLoading, setError]);

  if (isLoading) {
    return <p>Loading popular anime...</p>;
  }

  return (
    <div className="popular-anime-container">
      <h2 className='popular-anime-title'>Popular Anime</h2>
        <div className="popular-anime-grid">
          {popularAnime &&
            popularAnime.map((anime) => (
              <div key={anime.mal_id} className="popular-anime-item">
                <img src={anime.images.jpg.image_url} alt={anime.title} className="popular-anime-image" />
                <h3 className='popular-anime-name'>{anime.title}</h3>
              </div>
            ))}
        </div>

    </div>
  );
}
function HomeContent() {
    const [isLoading, setIsLoading] = useState(true);   
    const [error, setError] = useState('');

    const fetchData = async () => {
      setError('');
      try {
        // Add a 2.5-second delay before fetching
        await new Promise(resolve => setTimeout(resolve, 2500));


        const response = await fetch('https://api.jikan.moe/v4/top/anime');
        if (!response.ok) {
          throw new Error('Network response was not ok');          
        }
      } catch (err) {
          setError('Failed to load anime.');
      } finally {
          setIsLoading(false);
      }
    };

    useEffect(() => {
      
      fetchData();
    }, [setError]);
    
    
    return (
        <>
            <TopAiringCarousel isLoading={isLoading} error={error} />
            <PopularAnime isLoading={isLoading} error={error}/>
        </>
    );
}

function Home() {

  return (
      <div className="App">
          <h1>Welcome to the Anime Schedule App!</h1>
          <div>
          <HomeContent/>

          </div>

          <Link to="/schedule" className="schedule-button"> Go to Schedule</Link>
      </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
      </Routes>
    </Router>
  );
}
export default App;
