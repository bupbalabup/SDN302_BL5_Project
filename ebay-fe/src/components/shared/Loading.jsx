// Simple loading with text
export const SimpleLoading = ({ message }) => {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col space-y-4 bg-black/10">
      <div className="h-12 w-12 border-b-2 border-blue-300 rounded-full animate-spin"></div>
      {message && <p className="text-gray-500 text-lg">{message}</p>}
    </div>
  );
};

// Dots loading
export const LoadingDots = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex space-x-1">
        <div className="w-4 h-4 bg-blue-500 animate-bounce rounded-full"></div>
        <div
          className="w-4 h-4 bg-blue-500 animate-bounce rounded-full"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-4 h-4 bg-blue-500 animate-bounce rounded-full"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
      {message && <p className="text-gray-500 text-lg">{message}</p>}
    </div>
  );
};

// Pulse Loading
export const LoadingPulse = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex space-x-2">
        <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
        <div
          className="h-4 w-4 rounded-full bg-blue-400 animate-pulse"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="h-4 w-4 rounded-full bg-blue-300 animate-pulse"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
      {message && <p className="text-gray-500 text-lg">{message}</p>}
    </div>
  );
};

// Skeleton loading
export const SkeletonLoading = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-80 mb-4"></div>
          <div className="h-5 bg-gray-200 rounded animate-pulse w-96"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Spinner and overlay loading
export const OverlayLoading = ({ message = "" }) => {
  return (
    <div className="fixed inset-0 bg-black/15 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
};

const Loading = ({ type = "simple", ...props }) => {
  switch (type) {
    case "simple":
      return <SimpleLoading {...props} />;
    case "dots":
      return <LoadingDots {...props} />;
    case "pulse":
      return <LoadingPulse {...props} />;
    case "skeleton":
      return <SkeletonLoading {...props} />;
    case "overlay":
      return <OverlayLoading {...props} />;
    default:
      return <SimpleLoading {...props} />;
  }
};

export default Loading;
