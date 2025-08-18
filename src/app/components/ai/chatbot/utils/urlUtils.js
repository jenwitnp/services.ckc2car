export const urlUtils = {
  openCarDetail: (fullUrl, title, carId) => {
    console.log("Car detail clicked:", { fullUrl, title, carId });

    if (fullUrl) {
      const url = fullUrl.startsWith("http")
        ? fullUrl
        : `${window.location.origin}${fullUrl}`;

      console.log("Opening car detail URL:", url);
      window.open(url, "_blank");
    }
  },

  openSearchResults: (query) => {
    try {
      const baseUrl = window.location.origin;
      const searchQuery = {
        ...query,
        page: 1,
        pageSize: 20,
        limit: null,
      };

      const queryParam = encodeURIComponent(JSON.stringify(searchQuery));
      const searchUrl = `${baseUrl}/cars/search?q=${queryParam}&from=ai`;

      console.log("[urlUtils] Opening search URL:", searchUrl);
      window.open(searchUrl, "_blank");
    } catch (error) {
      console.error("[urlUtils] Error opening search:", error);
      alert("ขออภัยค่ะ ไม่สามารถเปิดหน้าค้นหาได้ กรุณาลองใหม่อีกครั้ง");
    }
  },

  openFallbackSearch: () => {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/cars/search?from=ai&fallback=true`, "_blank");
  },
};
