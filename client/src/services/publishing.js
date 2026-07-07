import api from "./api";

// One factory, any resource — `basePath` is the only thing that varies.
export function createPublishingApi(basePath) {
  return {
    publish: id => api.patch(`${basePath}/${id}/publish`),
    unpublish: id => api.patch(`${basePath}/${id}/unpublish`),
    schedule: (id, scheduledAt) => api.patch(`${basePath}/${id}/schedule`, { scheduledAt }),
    archive: id => api.patch(`${basePath}/${id}/archive`),
  };
}
