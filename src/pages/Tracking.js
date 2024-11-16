import TrackItem from '../components/tracking/TrackItem';


const tracking = [
    {
        id: 0,
        plate: 0,
        teacher: 0,
        course: 1,
        numberOfStudent: 1,
        courseState: 0,
        startDate: null,
        endDate: null,
        status: 1,
    },
    {
        id: 1,
        plate: 1,
        teacher: 1,
        course: 1,
        numberOfStudent: 2,
        courseState: 0,
        startDate: null,
        endDate: null,
        status: 1,
    }
]

export default function Tracking() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tracking.map((track) => (
          <TrackItem track={track} />
        ))}
      </div>
    </div>
  );
}
