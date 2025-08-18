import Image from "next/image";
import Link from "next/link";

export function DealerInfo({ name, address, phone, image, mapUrl }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          สถานที่ดูรถ
        </h2>

        {/* Dealer info */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <Image
              src={image || "/images/dealer-placeholder.jpg"}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-4">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">สาขา</p>
          </div>
        </div>

        {/* Address */}
        <div className="flex mb-4">
          <svg
            className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
            {address}
          </span>
        </div>

        {/* Phone */}
        <div className="flex mb-6">
          <svg
            className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
            {phone}
          </span>
        </div>

        {/* Map link */}
        <Link
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-center block w-full py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          ดูแผนที่
        </Link>
      </div>

      {/* Dealer image or map preview */}
      <div className="relative w-full h-40 bg-gray-200">
        <Image
          src="/images/map-preview.jpg"
          alt="Map preview"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
