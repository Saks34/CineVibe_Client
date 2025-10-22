import React from 'react';

const Watchlist = ({ movies }) => {
  return (
    <div className="watchlist-page">
      {movies && movies.length === 0 ? (
        <div className="empty-message">No movies found in your Watchlist.</div>
      ) : (
        movies.map((movie) => (
          <div key={movie.id} className="movie-item">
            <h3>{movie.title}</h3>
            <p>{movie.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Watchlist;