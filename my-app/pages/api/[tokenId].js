// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// tokenURI = Base URI + TokenID
// Base URI = http://example.com
// TokenID = 1
// tokenURI = http://example.com/1

export default function handler(req, res) {
  const tokenId = req.query.tokenId;

  const name = `Crypto Dev ${tokenId}`;
  const description = "Crypto Devs is an NFT collection for Web3 developers";
  const image = ``; //TODO: add URI after deploying

  res.status(200).json({ name, description, image })
}
