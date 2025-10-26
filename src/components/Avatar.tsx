import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { selectIsUserOnline } from "@/store/slices/presenceSlice";

const Avatar = ({
  userId,
  avatar,
  displayName,
}: {
  userId: string;
  avatar?: string;
  displayName: string;
}) => {
  const isOnline = useAppSelector((state) => selectIsUserOnline(state, userId));

  return (
    <div className="relative w-8 h-8">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold overflow-hidden">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          displayName.charAt(0).toUpperCase()
        )}
      </div>
      <span
        className={cn(
          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
          isOnline ? "bg-green-500" : "bg-gray-400"
        )}
      ></span>
    </div>
  );
};

export default Avatar;
