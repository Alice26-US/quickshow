import React, { useEffect, useState } from "react";
import { dummyBookingData } from "../assets/assets";
import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";

const MyBookings = () => {
  const currency = "FCFA"; // Phase 2: could also use env var
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMyBookings = async () => {
    setBookings(dummyBookingData);
    setIsLoading(false);
  };

  useEffect(() => {
    getMyBookings();
  }, []);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />
      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.map((items, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
        >
          <div className="flex flex-col md:flex-row">
            <img
              src={items.show.movie.poster_path}
              alt=""
              className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
            />
            <div className="flex flex-col p-4">
              <p className="text-lg font-semibold">{items.show.movie.title}</p>
              <p className="text-gray-400 text-sm">{timeFormat(items.show.movie.runtime)}</p>
              <p className="text-gray-400 text-sm mt-auto">{dateFormat(items.show.movie.showDateTime)}</p>

              {/* Phase 2: Show type of ticket (Regular/3D/IMAX) */}
              {/* Example: <p className="text-sm text-gray-500">{items.ticketType}</p> */}
            </div>
          </div>

          <div className="flex flex-col md:items-end md-text-right justify-between p-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-400">
                {currency} {items.amount} {/* Phase 2: calculate total based on seat type */}
              </p>
              {!items.isPaid && (
                <button className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer">
                  Payment Now
                </button>
              )}
            </div>
            <div className="text-sm">
              <p>
                <span className="text-gray-400">Total Seats:</span> {items.bookedSeats.length}
              </p>
              <p>
                <span className="text-gray-400">Seat Numbers:</span> {items.bookedSeats.join(", ")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;