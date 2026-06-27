function createEntitlementsForPlan(plan) {
  if (plan === "pro") {
    return {
      enabled: {
        preview: true,
        "copy-html": true,
        "theme-basic": true,
        "theme-premium": true,
        "draft-publish": true,
        "image-upload": true,
        "cover-upload": true,
        "multi-account": true,
        "draft-history": true
      }
    };
  }
  return {
    enabled: {
      preview: true,
      "copy-html": true,
      "theme-basic": true,
      "theme-premium": false,
      "draft-publish": false,
      "image-upload": false,
      "cover-upload": false,
      "multi-account": false,
      "draft-history": false
    }
  };
}

