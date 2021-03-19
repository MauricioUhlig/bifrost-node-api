exports.randKey = (length) => {
    return (Math.random().toString(36).substring(2, 15) 
            + Math.random().toString(36).substring(2, 15) 
            + Math.random().toString(36).substring(2, 15))
            .toString()
            .substring(0,length);
}

