const Avatar = ({
  avatar,
  displayName,
}: {
  avatar?: string;
  displayName: string;
}) => {
  return (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
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
  );
};

export default Avatar;
