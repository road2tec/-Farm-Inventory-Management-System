"use client";
import { useUser } from "@/context/AuthProvider";
import { Ride } from "@/types/Ride";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const PublishARide = () => {
  const { user } = useUser();
  const [ride, setRide] = useState<Ride>({
    title: "",
    organiser: user?._id!,
    date: new Date(),
    time: "",
    from: "",
    to: "",
    car: {
      name: "",
      number: "",
      capacity: 0,
    },
    passengers: [],
    pricePerSeat: 0,
    isFull: false,
    status: "scheduled",
  });
  const handleSubmit = async () => {
    if (
      !ride.title ||
      !ride.date ||
      !ride.time ||
      !ride.from ||
      !ride.to ||
      !ride.car.name ||
      !ride.car.number ||
      !ride.car.capacity ||
      !ride.pricePerSeat
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    try {
      const res = axios.post("/api/rides/publish", { ride });
      toast.promise(res, {
        loading: "Publishing...",
        success: "Published successfully",
        error: "Failed to publish",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish");
    }
  };
  return (
    <>
      <h1 className="text-4xl font-bold mb-6 text-center uppercase">
        Publish A Ride
      </h1>
      <div className="w-full max-w-2xl mx-auto px-6 py-6 space-y-3 border border-base-content rounded-2xl">
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-base">Title</legend>
          <input
            type="text"
            className="input input-primary w-full"
            placeholder="Ride Title"
            value={ride?.title}
            onChange={(e) => {
              setRide({ ...ride, title: e.target.value });
            }}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-base">Date</legend>
          <input
            type="date"
            className="input input-primary w-full"
            placeholder="Ride Date"
            value={ride?.date}
            onChange={(e) => {
              setRide({ ...ride, date: e.target.value });
            }}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-base">Time</legend>
          <input
            type="time"
            className="input input-primary w-full"
            placeholder="Ride Start Time"
            value={ride?.time}
            onChange={(e) => {
              setRide({ ...ride, time: e.target.value });
            }}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-base">Ride Start From</legend>
          <input
            type="text"
            className="input input-primary w-full"
            placeholder="Ride Start From"
            value={ride?.from}
            onChange={(e) => {
              setRide({ ...ride, from: e.target.value });
            }}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-base">Ride Ends To</legend>
          <input
            type="text"
            className="input input-primary w-full"
            placeholder="Ride Ends To"
            value={ride?.to}
            onChange={(e) => {
              setRide({ ...ride, to: e.target.value });
            }}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-base">Car Name</legend>
          <input
            type="text"
            className="input input-primary w-full"
            placeholder="Ride Car Name"
            value={ride?.car.name}
            onChange={(e) => {
              setRide({ ...ride, car: { ...ride.car, name: e.target.value } });
            }}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-base">
            Car Number Plate
          </legend>
          <input
            type="text"
            className="input input-primary w-full"
            placeholder="Ride Car Number Plate"
            value={ride?.car.number}
            onChange={(e) => {
              setRide({
                ...ride,
                car: { ...ride.car, number: e.target.value },
              });
            }}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-base">Car Capacity</legend>
          <input
            type="number"
            className="input input-primary w-full"
            placeholder="Ride Car Capacity"
            value={ride?.car.capacity}
            onChange={(e) => {
              setRide({
                ...ride,
                car: { ...ride.car, capacity: parseInt(e.target.value) },
              });
            }}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-base">
            Car Per Seat Price
          </legend>
          <input
            type="text"
            className="input input-primary w-full"
            placeholder="Ride Car Per Seat Price"
            value={ride?.pricePerSeat}
            onChange={(e) => {
              setRide({ ...ride, pricePerSeat: parseInt(e.target.value) });
            }}
          />
        </fieldset>

        <button className="btn btn-primary w-full mt-6" onClick={handleSubmit}>
          Publish Ride
        </button>
      </div>
    </>
  );
};

export default PublishARide;
