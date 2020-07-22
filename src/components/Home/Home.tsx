import React, { Fragment } from 'react';
import axios from 'axios';
class Home extends React.Component<any> {
	grid: any[] = [];
	colors: any = {};
	result: any[] = [];
	state: any = { count: 0 };

	componentDidMount = async () => {
		try {
			const tiles = await axios.get(`${process.env.REACT_APP_API_BACKEND_URL}/start-game`);
			const {
				data: { data },
			} = tiles;
			this.setState({ data });
		} catch (error) {
			this.setState({ error: 'No connection, make sure you have a server connection' });
		}
	};

	setRandomColor = (): string => {
		const colorSign = '#';
		const randomNumber = Math.floor(Math.random() * 16777215).toString(16);
		return `${colorSign}${randomNumber}`;
	};

	getArray = (num: number) =>
		Array(num)
			.fill(1)
			.map((i, idx) => idx);

	private markMe = (b_row: number, b_col: number) => (event: any) => {
		const { data } = this.state;
		const origin = [b_row - 1, b_col - 1].filter((v) => v > -1);
		if (origin.length !== 2) return;

		const tileHasOrigin = origin.length === 2 && this.colors[origin.join('')] === this.colors[`${b_row}${b_col}`];
		if (!tileHasOrigin) {
			this.setState({ error: 'The selected tile has no origin, please select another tile with an origin' });
			return;
		}

		const [row, col] = origin;

		const top = [row - 1, col].filter((v) => v > -1);
		const right = [row, col + 1].filter((v) => v < data.cols.length);
		const bottom = [row + 1, col].filter((v) => v < data.rows.length);
		const left = [row, col - 1].filter((v) => v > -1);

		this.setState({ origin, top, left, bottom, right, selected: `${b_row}${b_col}` });
		this.setState({ error: '' });
	};

	private shuffleMe = (colorIdx: number) => (event: any) => {
		const { top, left, bottom, right, selected, count } = this.state;
		if (!selected) {
			this.setState({ error: 'You have not selected any tile, choose a tile with an origin to continue ...' });
			return;
		}
		this.colors[top.join('')] = this.colors[left.join('')] = this.colors[bottom.join('')] = this.colors[
			right.join('')
		] = colorIdx;
		const won = Object.values(this.colors).every((num) => num === colorIdx);
		this.setState({ count: count + 1, won });
	};

	render() {
		const { error, data, count, won } = this.state;
		return (
			<Fragment>
				<div className="my-2 text-center">
					<h2 className="h2">Game Tile</h2>
					<small className="w-50 tex-secondary">
						For each move, choose the color that will result in the largest number of tiles connected to the
						origin; <br /> If there is a tie, break ties by choosing the color that has the lowest rank
						among the colors.
					</small>
					<div className="my-4 row justify-content-center">
						<div className="d-flex flex-column align-items-center">
							{' '}
							<table className="table border-top-0 w-auto m-auto tile-table ">
								<tbody>
									{data
										? data.rows.map((i: any, idx: number) => {
												this.grid[idx] = [];
												return (
													<tr key={i * idx}>
														{data.cols.map((j: any, idx1: number) => {
															this.grid[idx][idx1] = j;
															this.result = this.colors;
															if (this.colors[`${i}${j}`] === undefined) {
																this.colors[`${i}${j}`] = Math.floor(
																	Math.random() * data.colors.length
																);
															}

															const background = data.colors[this.colors[`${i}${j}`]];

															return (
																<td
																	onClick={this.markMe(i, j)}
																	className={`p-4 ${
																		this.state.selected === `${i}${j}`
																			? 'selected'
																			: ''
																	}`}
																	style={{
																		backgroundColor: background,
																	}}
																	key={j * idx1}
																>
																	{i} {j}
																</td>
															);
														})}
													</tr>
												);
										  })
										: ''}
								</tbody>
							</table>
							<small className="text-danger pt-3">{error}</small>
							<div className="text-center clickable-colors my-5 ">
								{data ? (
									data.colors.map((c: any, i: any) => {
										return (
											<button
												key={i}
												className="btn btn-small btn-outline-light shadow-sm mx-4 colors"
												style={{ backgroundColor: c }}
												onClick={this.shuffleMe(i)}
											>
												{i}
											</button>
										);
									})
								) : (
									<p className="m-auto">Loading .....</p>
								)}
							</div>
						</div>
						<div className="text-secondary text-left mx-4 d-flex flex-column">
							{/* <small>
								AI Moves: <strong>2</strong>
							</small> */}
							<small>
								Player Moves: <strong>{count}</strong>
							</small>
							<small style={{ display: won ? 'block' : 'none' }}>
								Status: <strong>{won ? 'You have won' : ''}</strong>
							</small>
						</div>
					</div>
				</div>
			</Fragment>
		);
	}
}
export default Home;
