"use client";
import { Ride } from "@/types/Ride";
import { IconCirclePlus } from "@tabler/icons-react";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

const PublishRidePage = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const fetchRides = async () => {
    const res = await axios.get("/api/rides");
    setRides(res.data.rides);
  };
  useEffect(() => {
    fetchRides();
  }, []);
  return (
    <>
      <h1 className="text-4xl font-bold mb-6 text-center uppercase">
        Ride Managements
      </h1>
      <Link
        href={"/user/publish-a-ride"}
        className="btn btn-primary btn-outline w-full mb-4"
      >
        Publish A Ride <IconCirclePlus size={18} />{" "}
      </Link>
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-300">
        <table className="table table-zebra">
          {/* head */}
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>From</th>
              <th>To</th>
              <th>Car Name</th>
              <th>Car Number</th>
              <th>Car Capacity</th>
              <th>Price Per Seat</th>
              <th>Status</th>
              <th>Is Full</th>
            </tr>
          </thead>
          <tbody>
            {rides.length !== 0 ? (
              rides.map((ride: Ride, index: number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{ride.title}</td>
                  <td>{new Date(ride.date).toLocaleDateString()}</td>
                  <td>{ride.time}</td>
                  <td>{ride.from}</td>
                  <td>{ride.to}</td>
                  <td>{ride.car.name}</td>
                  <td>{ride.car.number}</td>
                  <td>{ride.car.capacity}</td>
                  <td>{ride.pricePerSeat}</td>
                  <td>{ride.status}</td>
                  <td>{ride.isFull ? "Yes" : "No"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="text-center">
                  No Rides Found Publish
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PublishRidePage;
