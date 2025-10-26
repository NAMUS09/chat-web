import RegistrationForm from "@/components/RegistrationForm";

const RegistrationPage = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-md">
        <RegistrationForm />
      </div>
    </div>
  );
};

export default RegistrationPage;
