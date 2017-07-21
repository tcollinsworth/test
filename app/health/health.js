import express from 'express'

const router = new express.Router()

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *     - Health
 *     summary: Return health
 *     description: Returns health of service
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: healthy
 *       500:
 *         description: not healthy
 */
router.get('/health', (req, res) => {
  // TODO test all dependencies and report status
  res.json({})
})

export default router
